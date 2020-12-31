//env
const dotenv = require('dotenv')
const result = dotenv.config()
if (result.error) {
  const path = `.env`
  dotenv.config({ path })
}
const { customConsole } = require('./utils/functions')
global.console = customConsole

const { ApolloServer, ForbiddenError } = require('apollo-server-koa')
const Koa = require('koa')



const jsonwebtoken = require('jsonwebtoken')
const { dbInstanceFactory } = require('./db')
const {
  contextDbInstance,
  validateToken,
 
  errorHandlingMiddleware
} = require('./middleware')
const { schema, initializedDataSources, getDataSources, getDataLoaders } = require('./startup/index')

const app = new Koa()

app.use(errorHandlingMiddleware())

app.use(contextDbInstance())

const server = new ApolloServer({
  schema,
  dataSources: getDataSources,
  subscriptions: {
    onConnect: async (connectionParams, _webSocket, context) => {
      const token = connectionParams.authorization.replace('Bearer ', '')

      if (!token) {
        throw new ForbiddenError('401 Unauthorized')
      }

      await validateToken(token)

      const decoded = jsonwebtoken.decode(token)

      const dbInstance = await dbInstanceFactory()

      if (!dbInstance) {
        throw new TypeError('Could not create dbInstance. Check the database configuration info and restart the server.')
      }
      return {
        token,
        dbInstance,
        dataSources: initializedDataSources(context, dbInstance),
        dataLoaders: getDataLoaders(dbInstance),
        externalUser: {
          id: decoded.sub,
          role: decoded.role
        }
      }
    }
  },
  context: async context => {
    const { ctx, connection } = context

    if (connection) {
      return {
        ...connection.context
      }
    } else {
      const { token, dbInstance, externalUser, correlationId, request, requestSpan } = ctx
      return {
        token,
        dbInstance,
        dataLoaders: getDataLoaders(dbInstance),
        dbInstanceFactory,
        externalUser,
        correlationId,
        request,
        requestSpan
      }
    }
  },
  uploads: {
    // Limits here should be stricter than config for surrounding
    // infrastructure such as Nginx so errors can be handled elegantly by
    // graphql-upload:
    // https://github.com/jaydenseric/graphql-upload#type-processrequestoptions
    maxFileSize: 1000000, // 1 MB
    maxFiles: 20
  }
})

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
const port = process.env.PORT || 4000
const httpServer = app.listen(port, () => {
  console.log(`🚀  Server ready at http://localhost:${port}/graphql`)
  console.log(`🚀  Subscriptions ready at ws://localhost:${port}/graphql`)
})

server.applyMiddleware({ app })
server.installSubscriptionHandlers(httpServer)

process.on('uncaughtException', function (error) {
  throw new TypeError(`Error occurred while processing the request: ${error.stack}`)
})
