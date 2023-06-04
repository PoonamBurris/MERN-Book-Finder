const { User } = require("../models");

const { AuthenticationError } = require("apollo-server-express");

const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    activeUser: async (_, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-_v -password")
        //   .populate("books");
        return userData;
      } 
        throw new AuthenticationError("please log in");
    
    },
  },

  Mutation: {
    createUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
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
      return { token, user };
    },

    saveBook: async (_, { bookdata }, context) => {
      if (context.user) {
        
      const addBooktoUser = await User.findByIdAndUpdate(
        { _id: context.user._id },
        { $push: { savedBooks: bookdata } },
        { new: true }
      );
      return addBooktoUser;
    }
    throw new AuthenticationError("err");
    },

    delBook: async (_,  {bookId} , context) => {
        if (context.user) {
        
            const delBookfromUser = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $pull: { savedBooks: { bookId } } },
              { new: true }
            );
            return delBookfromUser;
          }
          throw new AuthenticationError("err");
        },
  },
};

module.exports = resolvers;