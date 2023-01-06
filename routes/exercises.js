const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

// User model
const User = require("../models/User");

// Exercise model
const Exercise = require("../models/Exercise");

// Add Treatment Page
router.get("/addExercise", ensureAuthenticated, (req, res) => {
  res.render("addTask");
});

// Edit Treatment Page
router.get("/editExercise/:id", ensureAuthenticated, (req, res) => {
  const userId = req.params.id;
  const put = "PUT";
  Treatment.findById(userId)
    .then((user) => {
      res.render("editTreatment", {
        userId: userId,
        treatmentNumber: user.treatmentNumber,
        workerEmail: user.workerEmail,
        treatmentInformation: user.treatmentInformation,
        carNumber: user.carNumber,
        inputDate: user.inputDate,
        tempTreatmentNumber: user.treatmentNumber,
        put: put,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Add Treatment Handle
router.post("/addExercise", ensureAuthenticated, (req, res) => {
  const { name, description, videoLink } = req.body;
  let errors = [];

  //Check required fields
  if (!name || !description || !videoLink) {
    errors.push({ msg: "Please fill in all fields" });
  }
  if (errors.length > 0) {
    res.render("addExercise", {
      errors,
      name,
      description,
      videoLink,
    });
  } else {
    Exercise.findOne({ name: name })
      .then((exercise) => {
        if (exercise) {
          errors.push({ msg: "The exercise exist" });
          res.render("addExercise", {
            errors,
            name,
            description,
            videoLink,
          });
        } else {
          const exercise = new Exercise({
            name: name,
            description: description,
            videoLink: videoLink,
          });

          exercise
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

// Edit Treatment Handle
router.post("/editExercise/:id", ensureAuthenticated, (req, res) => {
  const userId = req.params.id;
  const {
    treatmentNumber,
    carNumber,
    treatmentInformation,
    workerEmail,
    put,
    tempTreatmentNumber,
  } = req.body;
  let errors = [];

  //Check required fields
  if (!treatmentNumber || !carNumber || !treatmentInformation || !workerEmail) {
    errors.push({ msg: "Please fill in all fields" });
  }

  if (errors.length > 0) {
    res.render("editTreatment", {
      errors,
      treatmentNumber,
      carNumber,
      treatmentInformation,
      workerEmail,
      userId,
      tempTreatmentNumber,
      put,
    });
  } else {
    if (tempTreatmentNumber !== treatmentNumber) {
      Treatment.findOne({ treatmentNumber: treatmentNumber }).then(
        (treatment) => {
          if (treatment) {
            errors.push({ msg: "The treatment number exist" });
            res.render("editTreatment", {
              errors,
              treatmentNumber,
              carNumber,
              treatmentInformation,
              workerEmail,
              userId,
              tempTreatmentNumber,
              put,
            });
          } else {
            Treatment.findByIdAndUpdate(userId, req.body, {
              useFindAndModify: false,
            })
              .then(() => {
                res.redirect("/dashboard");
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
      );
    } else {
      Treatment.findByIdAndUpdate(userId, req.body, { useFindAndModify: false })
        .then(() => {
          res.redirect("/dashboard");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
});

// Delete Treatment Handle
router.get("/deleteExercise/:id", ensureAuthenticated, (req, res) => {
  const id = req.params.id;
  Treatment.findByIdAndDelete(id)
    .then(() => {
      res.redirect("/dashboard");
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
