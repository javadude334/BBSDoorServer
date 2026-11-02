# Downloading BBSDoorServer without knowing GitHub

**GitHub** stores the project's files. You do not need a GitHub account to view or download a public project.

Project page: https://github.com/javadude334/BBSDoorServer

For a simple download, open the project page, choose **Code** and **Download ZIP**, then extract the files into a new folder. A ZIP download is a snapshot; it does not update itself.

**Git** is an optional tool for downloading and updating the project:

```text
git clone https://github.com/javadude334/BBSDoorServer.git
```

To update a clean checkout on the main branch:

```text
git pull --ff-only origin main
```

Do not overwrite a configured game directory or save files with an update. If Git reports conflicts or local changes, stop and ask for help.

**Node.js** is the software used to run the current foundation; **npm** is its package tool. Neither Git nor programming skills should be required for a future packaged SysOp release.
