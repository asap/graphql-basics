import faker from 'faker';

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

const db = {
  users,
  posts,
  comments,
};

export { db as default };
