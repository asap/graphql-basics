const Query = {
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
  users(parent, args, { db }, info) {
    if (!args.query) {
      return db.users;
    }
    return db.users.filter(user =>
      user.name.toLowerCase().includes(args.query.toLowerCase()),
    );
  },
  posts(parent, args, { db }, info) {
    if (!args.query) {
      return db.posts;
    }
    return db.posts.filter(post => {
      const isTitleMatch = post.title
        .toLowerCase()
        .includes(args.query.toLowerCase());
      const isBodyMatch = post.body
        .toLowerCase()
        .includes(args.query.toLowerCase());

      return isTitleMatch || isBodyMatch;
    });
  },
  comments(parent, args, { db }, info) {
    return db.comments;
  },
};
export { Query as default };
