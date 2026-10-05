const express = require("express");
const validate = require("../middlewares/validate");
const { idParams } = require("../validators/common");
const { courseListQuery, courseBody } = require("../validators/courses");
const courses = require("../controllers/courses");

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

module.exports = router;
