const {
  SimpleResponse,
  Carousel,
  Image,
  Button,
  Suggestions,
  BasicCard,
  LinkOutSuggestion,
} = require("actions-on-google");
const buildUrl = require("build-url");
const stripHtml = require("string-strip-html");

const { api, setJWT } = require("./api");
const { convertCourseToBasicCard } = require('./findByCourseIntent');
const { enrol } = require('./enrolment');

const context = {
  FIND_BY_TOPIC_FOLLOWUP: 'find_by_topic-followup',
}

module.exports = {
  findByTopicIntent: conv => {
    const { topics } = conv.parameters;
    const { token } = conv.user.access;

    setJWT(token);

    return getExplore(topics, conv.data.portal.id).then(res => {
      responseListCourse(topics, res, conv);
    }).catch(e => {
      conv.ask(new SimpleResponse('Oops! Sorry I did get that'));
    });
  },

  findByTopicMoreIntent: conv => {
    const { topics } = conv.contexts.input["find_by_topic-followup"].parameters;
    const { token } = conv.user.access;

    setJWT(token);

    conv.ask("Ok, load more " + topics);
    return getExplore(topics, conv.data.portal.id).then(res => {
      responseListCourse(topics, res, conv);
    });
  },

  findByTopicSelected: (conv, params, option) => {
    const course = conv.data.courses[option];
    const portal = conv.data.portal;
    if (course) {
      conv.ask("Here's some information about the course" + course.title + ". Do you want to enroll?");
      conv.ask(new BasicCard(convertCourseToBasicCard(course, portal)));
      conv.ask(new Suggestions(['Yes'], ['No']));
      conv.contexts.set(context.FIND_BY_TOPIC_FOLLOWUP, 3, {
        option,
      });
    } else {
      conv.ask('Please pick a course to continue');
    }
  },

  findByTopicEnroll: (conv, params, option) => {
    const course = conv.data.courses[conv.contexts.input[context.FIND_BY_TOPIC_FOLLOWUP].parameters.option];
    const { token } = conv.user.access;

    setJWT(token);

    if (course) {
      return enrol(course.courseId, token).then(res => {
        conv.ask(new SimpleResponse(`Congrats! You have already enrolled to course ${course.title}`));
        conv.ask(new Suggestions(['Give feedback']));

        const portal = conv.data.portal;

        conv.ask(new LinkOutSuggestion({
          name: 'Open the course',
          url: makeLinkToCourseInProgress(course.courseId, portal.url, portal.id),
        }));
      })
      .catch(e => {
        conv.ask('Oops! Sorry I did get that');
      });
    } else {
      conv.ask('Please pick a course to continue');
    }
  }
};

function convertHitsToList(hits) {
  const KEYS = ["FIRST", "SECOND", "THIRD", "FOURTH"];
  const listItems = {};
  hits.forEach((item, index) => {
    listItems[KEYS[index]] = {
      courseId: item.id,
      title: item.title || 'No title ' + index,
      description: stripHtml(item.description),
      image: new Image({
        url: item.image,
        alt: item.title || 'No alt',
      })
    };
  });

  return listItems;
}

function makeLinkToCourseInProgress(courseId, portalUrl, portal) {
  // https://wonderminds.mygo1.com/p/#/app/course/6701786/progress?instance=6692083
  return `https://${portalUrl}/p/#/app/course/${courseId}/progress?instance=${portal}`;
}

function getExplore(topics, portal) {
  const url = buildUrl("", {
    path: "/v2/learning-objects",
    queryParams: {
      // admin: 1,
      // "type[]": "course",
      limit: 4,
      // "keyword[all]": topics,
      // "sort[0][field]": "relevant",
      // "sort[0][direction]": "desc",
      offset: 0,
      'provider[]': portal,
    }
  });

  return api.get(url);
}

function convertHitsToBasicCard(course) {
  return {
    title: course.title,
    image: new Image({
      url: course.image,
      alt: course.title,
    }),
    text: stripHtml(course.description),
  }
}

function convertHitsDataToCourse(hits) {
  return {
    courseId: hits.id,
    title: hits.title,
    description: stripHtml(hits.description),
    image: {
      url: hits.image,
    }
  }
}

function responseListCourse(topics, res, conv){
  const items = convertHitsToList(res.data.hits);
  if (res.data.hits.length >= 2) {
    conv.ask(
      new SimpleResponse('Sure, here are a few thing you can learn. Which one sounds interesting ?')
    );
    conv.data.courses = items;
    conv.ask(
      new Carousel({
        items
      })
    );
  } else if (res.data.hits.length == 1) {
    conv.ask(
      new SimpleResponse('Sure, here are a few thing you can learn. Which one sounds interesting ?')
    );
    const course = convertHitsDataToCourse(res.data.hits[0]);
    conv.data.courses = {};
    conv.data.courses[course.courseId] = course;
    conv.ask(new BasicCard(convertHitsToBasicCard(res.data.hits[0])));
    conv.ask(new Suggestions(['Enrol this course'], ['Find other course']));
    conv.contexts.set(context.FIND_BY_TOPIC_FOLLOWUP, 2, {
      option: course.courseId,
    });
  } else {
    conv.ask(
      new SimpleResponse("Ooops! No course about " + topics + ". Try other content.")
    );
  }
}
