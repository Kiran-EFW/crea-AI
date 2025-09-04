import { getGithubUser } from "../handlers/github_handlers";

export async function getGitAuthor() {
  const user = await getGithubUser();
  const author = user
    ? {
        name: `[crea]`,
        email: user.email,
      }
    : {
        name: "[crea]",
        email: "git@crea.ai",
      };
  return author;
}
