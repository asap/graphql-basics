import faker from 'faker';
import uuidv4 from 'uuid/v4';
import { GraphQLServer } from 'graphql-yoga';

// I'm seeding data so I can be fancy!
const users = [...Array(5)].map(() => ({
  id: faker.random.uuid(),
  name: faker.name.firstName(),
  email: faker.internet.exampleEmail(),
  age: faker.random.number({ min: 20, max: 50 }),
}));

const validPost = user => ({
  id: faker.random.uuid(),
  title: faker.lorem.sentence(),
  body: faker.lorem.sentences(),
  published: faker.random.boolean(),
  author: user.id,
});

const posts = users.map(user => validPost(user));

const randomPost = posts => faker.random.arrayElement(posts);

const comments = users.map(user => ({
  id: faker.random.uuid(),
  text: faker.lorem.paragraph(),
  author: user.id,
  post: randomPost(posts).id,
}));

// Type Definitions (Schema)
const typeDefs = `
  type Query {
    me: User!
    post: Post!
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments: [Comment!]!
  }

  type Mutation {
    createUser(name: String!, email: String!, age: Int): User!
    createPost(title: String!, body: String!, published: Boolean!, author:ID!): Post!
    createComment(text: String!, author: ID!, post: ID!): Comment!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`;


// Resolvers
const resolvers = {
  Query: {
    me() {
      return {
        id: '1234',
        name: 'Lex',
        email: 'lex@example.com',
        age: 42,
      };
    },
    post() {
      return posts[0];
    },
    users(parent, args, ctx, info) {
      const { query } = args;
      if (!query) {
        return users;
      }
      return users.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()),
      );
    },
    posts(parent, args, ctx, info) {
      const { query } = args;
      if (!query) {
        return posts;
      }
      return posts.filter(post => {
        const isTitleMatch = post.title
          .toLowerCase()
          .includes(query.toLowerCase());
        const isBodyMatch = post.body
          .toLowerCase()
          .includes(query.toLowerCase());

        return isTitleMatch || isBodyMatch;
      });
    },
    comments(parent, args, ctx, info) {
      return comments;
    },
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some(user => user.email === args.email);

      if(emailTaken) {
        throw new Error("Email address is taken"); 
      }

      const user = {
        id: uuidv4(),
        ...args,
      };

      users.push(user);

      return user;
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some(user => user.id === args.author);

      if (!userExists) {
        throw new Error ("User not found");
      }

      const post = {
        id: uuidv4(),
        ...args,
      };

      posts.push(post);

      return post;
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some(user => user.id === args.author);

      if (!userExists) {
        throw new Error ("User not found");
      }

      const postExists = posts.some(post => post.id === args.post && post.published);

      if (!postExists) {
        throw new Error ("Post not found");
      }

      const comment = {
        id: uuidv4(),
        ...args,
      };

      comments.push(comment);
      return comment;
    },
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find(user => user.id === parent.author);
    },
    post(parent, args, ctx, info) {
      return posts.find(post => post.id === parent.post);
    },
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find(user => user.id === parent.author);
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => comment.post === parent.id);
    },
  },
  User: {
    comments(parent, args, ctx, info) {
      return comments.filter(comment => comment.author === parent.id);
    },
    posts(parent, args, ctx, info) {
      return posts.filter(post => post.author === parent.id);
    },
  },
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
});

server.start(() => {
  console.log('server is running');
});
