
This folder contains my work for Lab 07: Node.js utilities, student reports, a Courses API, and a Postman collection.

Setup:

Open this folder in VS Code. Open **Terminal > New Terminal** and install the package:

```powershell
npm install
```

## Task 1 - Command-line utilities

Run these commands in the VS Code terminal:

```powershell
node task1.js slug " Full Stack Web Development "
node task1.js capitalize "artificial intelligence lab"
node task1.js words "Node.js runs JavaScript on the server"
node task1.js status 2.45
node task1.js grade 78
node task1.js gpa 4.0:3 3.5:3 2.7:4
node task1.js info
```

For an invalid-input example, run `node task1.js status abc`.

## Task 2 - Student reports

Run the report generator:

```powershell
node task2.js
```

To report on one department only:

```powershell
node task2.js --dept "Data Science"
```

The report, CSV file, and activity log are saved in `reports/`.

## Task 3 - Servers

I start the Student API from the repository root using the command from that lab. In a second VS Code terminal, I start the Courses API from this `lab07` folder:

```powershell
npm run start:courses
```

The Courses API runs at `http://localhost:3000`. I keep its terminal open while using the API. For example, I can open these routes in a browser:

- `http://localhost:3000/api/courses`
- `http://localhost:3000/api/courses/stats`
- `http://localhost:3000/api/courses/CS-410`

If the Student API is already using port 3000 and I need both servers running, I start the Courses API on port 3001:

```powershell
$env:PORT=3001; npm run start:courses
```

## Task 4 - Postman

The collection is in `postman/Lab07_Courses_API.postman_collection.json`.

1. Start the Courses API on port 3000.
2. In Postman, choose **Import > File** and select the collection JSON file.
3. Open **Lab 07 Tasks**, choose **Run**, and run the **Courses API** folder.
4. Set **Iterations** to `2` and start the run. This runs the full request list twice.
5. Check that both iterations finish with no failed tests. Some requests expect an error response; those tests pass when the API returns the expected status.
6. Save a screenshot of the successful results as `screenshots/runner-result.png`.

The collection uses `http://localhost:3000`. If I use port 3001, I update the collection's `baseUrl` variable before running it. The collection creates a test course and deletes it at the end so I can run it again.

## Submission

- I add the complete `lab07` folder to my repository.
- I include `screenshots/runner-result.png`.
- I do not include `node_modules`; it is ignored by Git.
- From a fresh copy, I run `npm install`, then `npm start` to start the Courses API.
- From the repository root, I commit and push the folder:

  ```powershell
  git add lab07
  git commit -m "Lab 07 tasks completed"
  git push
  ```

The student records are in `data/students.json`. The CGPA status rules are in `utils/gradeUtils.js`; I update them if my Lab 06 table uses different thresholds.
