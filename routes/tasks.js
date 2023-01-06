const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

// User model
const User = require("../models/User");

// Exercise model
const Task = require("../models/Task");

// Show tasks
router.get("/tasks", ensureAuthenticated, (req, res) => {
  const user = req.user;
  Task.find({ userId: user._id }, (err, tasks) => {
    res.render("tasks", {
      name: req.user.firstName,
      taskList: tasks,
    });
  });
});

router.get("/Completed", ensureAuthenticated, (req, res) => {
  const user = req.user;
  Task.find({ userId: user._id }, (err, tasks) => {
    res.render("completed", {
      name: req.user.firstName,
      taskList: tasks,
    });
  });
});

router.get("/Incompleted", ensureAuthenticated, (req, res) => {
  const user = req.user;
  Task.find({ userId: user._id }, (err, tasks) => {
    res.render("incompleted", {
      name: req.user.firstName,
      taskList: tasks,
    });
  });
});

// Add Treatment Page
router
  .route("/addTask")
  .get(ensureAuthenticated, async (req, res) => {
    res.render("addTask");
  })
  .post(ensureAuthenticated, async (req, res) => {
    const { name, description, dueDate } = req.body;
    const user = req.user;
    let errors = [];

    //Check required fields
    if (!name || !description || !dueDate) {
      errors.push({ msg: "Please fill in all fields" });
    }
    if (new Date(dueDate) - new Date() < 0) {
      errors.push({ msg: "Please choose new date" });
    }
    if (errors.length > 0) {
      res.render("addTask", {
        errors,
        name,
        description,
        dueDate,
      });
    } else {
      Task.findOne({ name: name, userId: user._id })
        .then((tasks) => {
          if (tasks) {
            errors.push({ msg: "The task exist" });
            res.render("addTask", {
              errors,
              name,
              description,
              dueDate,
            });
          } else {
            const task = new Task({
              name: name,
              description: description,
              dueDate: dueDate,
              userId: user._id,
            });

            task
              .save()
              .then(() => {
                // Back to dashboard
                res.redirect("/dashboard");
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    }
  });

// Change Complete
router.get("/Complete/:id/:sendTo", ensureAuthenticated, (req, res) => {
  const { id, sendTo } = req.params;
  Task.findByIdAndUpdate(
    { _id: id },
    { state: true },
    {
      useFindAndModify: true,
    }
  )
    .then(() => {
      if (sendTo === "dashboard") res.redirect("/dashboard");
      else res.redirect(`/tasks/${sendTo}`);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Delete Task Handle
router.get("/incomplete/:id/:sendTo", ensureAuthenticated, (req, res) => {
  const { id, sendTo } = req.params;
  Task.findByIdAndUpdate(
    { _id: id },
    { state: false },
    {
      useFindAndModify: true,
    }
  )
    .then(() => {
      if (sendTo === "dashboard") res.redirect("/dashboard");
      else res.redirect(`/tasks/${sendTo}`);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Delete Task Handle
router.get("/deleteTask/:id/:sendTo", ensureAuthenticated, (req, res) => {
  const { id, sendTo } = req.params;
  Task.findByIdAndDelete(id)
    .then(() => {
      if (sendTo === "dashboard") res.redirect("/dashboard");
      else res.redirect(`/tasks/${sendTo}`);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
