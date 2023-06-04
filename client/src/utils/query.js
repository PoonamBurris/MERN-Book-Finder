import { gql } from "@apollo/client";

export const GET_USER = gql`
  {
    activeUser {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        image
        link
        title
      }
    }
  }
`;