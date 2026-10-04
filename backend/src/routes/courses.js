const express = require('express');
const validate = require('../middlewares/validate');
const { idParams } = require('../validators/common');
const { coursesQuery, courseBody, programCourseParams, linkBody, contactBody } = require('../validators/courses');
const courses = require('../controllers/courses');
const { sendQuestion } = require('../controllers/contact');

/**
 * Routes du catalogue de cours, de leurs rattachements aux formations, et de la
 * question à un institut (bloc BK6).
 *
 * @type {import('express').Router}
 */
const router = express.Router();

router.post('/contact', validate({ body: contactBody }), sendQuestion);

router.get('/admin/courses', validate({ query: coursesQuery }), courses.listCourses);
router.post('/admin/courses', validate({ body: courseBody }), courses.createCourse);
router.put('/admin/courses/:id', validate({ params: idParams, body: courseBody }), courses.updateCourse);
router.delete('/admin/courses/:id', validate({ params: idParams }), courses.deleteCourse);

router.put(
  '/admin/programs/:id/courses/:course_id',
  validate({ params: programCourseParams, body: linkBody }),
  courses.linkCourse,
);
router.delete(
  '/admin/programs/:id/courses/:course_id',
  validate({ params: programCourseParams }),
  courses.unlinkCourse,
);

module.exports = router;
