const express = require("express");
const validate = require("../middlewares/validate");
const { idParams } = require("../validators/common");

const courses = require("../controllers/courses");
const {
  courseListQuery,
  courseBody,
  attachParams,
  attachBody,
} = require("../validators/courses");
/**
 * Catalogue de cours (bloc BK6). Les chemins `/admin/...` sont protégés par
 * `app.use('/admin', requireAuth)`.
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.get(
  "/admin/courses",
  validate({ query: courseListQuery }),
  courses.list,
);
router.post("/admin/courses", validate({ body: courseBody }), courses.create);
router.put(
  "/admin/courses/:id",
  validate({ params: idParams, body: courseBody }),
  courses.update,
);
router.delete(
  "/admin/courses/:id",
  validate({ params: idParams }),
  courses.remove,
);
router.put(
  "/admin/programs/:id/courses/:course_id",
  validate({ params: attachParams, body: attachBody }),
  courses.attachToProgram,
);
router.delete(
  "/admin/programs/:id/courses/:course_id",
  validate({ params: attachParams }),
  courses.detachFromProgram,
);

module.exports = router;
