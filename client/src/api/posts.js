import axios from "axios";

const getPosts = async () => {
  return axios
    .get("http://localhost:3001/posts", { params: { _sort: "title" } })
    .then((res) => res.data);
};

const createPost = async ({ title, id }) => {
  const res = await axios.post("http://localhost:3001/posts", {
    title,
    id,
  });
  return res.data;
};

export { getPosts, createPost };
