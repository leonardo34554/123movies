require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const MONGODB_URI = process.env.MONGODB_URI;

var mydb = [];

if (MONGODB_URI) {
  setCollection("db", "myCollection");
}

function getStream(tt) {
  var i;
  for (var i = 0; i < mydb.length; i++) {
    if (mydb[i].id == tt) {
      break;
    }
  }

  if (i == mydb.length) {
    return [];
  }

  return [
    {
      name: "123Movies",
      title: "1080p",
      url: mydb[i].url,
    },
  ];
}

async function setCollection(db, col) {
  mydb = await getCollection(db, col);
  console.log(mydb);
}

function getCollection(db, col) {
  return MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true }).then(
    (client) =>
      client
        .db(db)
        .collection(col)
        .find({})
        .toArray()
        .then((res) => {
          client.close();
          return res;
        })
  );
}

module.exports = getStream;
