import { readSettings } from "../../main/settings";

export async function getGitAuthor() {
  const settings = readSettings();
  const user = settings.githubUser;
  const author = user
    ? {
        name: "[scalix]",
        email: user.email,
      }
    : {
        name: "[scalix]",
        email: "git@scalix.world",
      };
  return author;
}

