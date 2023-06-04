const { User } = require("../models");

const { AuthenticationError } = require("apollo-server-express");

const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    activeUser: async (_, args, context) => {
      if (context) {
        const userData = await User.findOne({ _id: context._id })
          .select("-_v -password")
          .populate("books");
        return userData;
      } else {
        throw new AuthenticationError("please log in");
      }
    },
  },

  Mutation: {
    createUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { user, token };
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError(
          "Incorrect Email or Password :( "
        );
      }
      const pw = await user.isCorrectPassword(password);
      if (!pw) {
        throw new AuthenticationError(
          "Incorrect Email or Password :( "
        );
      }
      const token = signToken(user);
      return { user, token };
    },

    saveBook: async (_, args, context) => {
      if (!context._id) {
        throw new AuthenticationError("err");
      }

      const addBooktoUser = await User.findByIdAndUpdate(
        { _id: context._id },
        { $addToSet: { savedBooks: args.input } },
        { new: true }
      );
      return addBooktoUser;
    },

    delBook: async (_,  args , context) => {
      if (!context) {
        throw new AuthenticationError("Login first!");
      }
      const delBookFromUser = await User.findByIdAndUpdate(
        { _id: context._id },
        { $pull: { savedBooks: { bookId: args.bookId } } }
      );
      return delBookFromUser;
    },
  },
};

module.exports = resolvers;