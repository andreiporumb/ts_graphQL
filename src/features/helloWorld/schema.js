const { gql } = require('apollo-server');

const helloWorldTypeDefs = gql`
extend type Query {
    myFirstEndpoint: String
}
`;

module.exports = helloWorldTypeDefs;