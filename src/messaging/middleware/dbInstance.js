const { dbInstanceFactory } = require('../../db')

const dbInstance = () => async (ctx, next) => {
  const dbInstance = await dbInstanceFactory()
  ctx.dbInstance = dbInstance

  await next()
}

module.exports = dbInstance
