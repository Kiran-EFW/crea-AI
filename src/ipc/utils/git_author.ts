import { readSettings } from "../../main/settings";

export async function getGitAuthor() {
  const settings = readSettings();
  const user = settings.githubUser;
  const author = user
    ? {
        name: "[crea]",
        email: user.email,
      }
    : {
        name: "[crea]",
        email: "git@crea.ai",
      };
  return author;
}

