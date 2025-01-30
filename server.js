// sample get request 

// const express = require("express");
// const axios = require("axios");


// const app = express();
// const port = process.env.PORT || 3000;

// async function fetchApiData(species) {
//   const apiResponse = await axios.get(
//     `https://www.fishwatch.gov/api/species/${species}`
//   );
//   console.log("Request sent to the API");
//   return apiResponse.data;
// }

// async function getSpeciesData(req, res) {
//   const species = req.params.species;
//   let results;

//   try {
//     results = await fetchApiData(species);
//     if (results.length === 0) {
//       throw "API returned an empty array";
//     }
//     res.send({
//       fromCache: false,
//       data: results,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(404).send("Data unavailable");
//   }
// }

// app.get("/fish/:species", getSpeciesData);

// app.listen(port, () => {
//   console.log(`App listening on port ${port}`);
// });




// sample get request using redis

// const express = require("express");
// const axios = require("axios");
// const redis = require("redis");

// const app = express();
// const port = process.env.PORT || 3000;

// let redisClient;

// (async () => {
//   redisClient = redis.createClient();

//   redisClient.on("error", (error) => console.error(`Error : ${error}`));

//   await redisClient.connect();
// })();

// async function fetchApiData(species) {
//   const apiResponse = await axios.get(
//     `https://www.fishwatch.gov/api/species/${species}`
//   );
//   console.log("Request sent to the API");
//   return apiResponse.data;
// }

// async function getSpeciesData(req, res) {
//   const species = req.params.species;
//   let results;
//   let isCached = false;

//   try {
//     const cacheResults = await redisClient.get(species);
//     console.log("cacheResults",cacheResults)
//     if (cacheResults) {
//       isCached = true;
//       results = JSON.parse(cacheResults);
//     } else {
//       results = await fetchApiData(species);
//       if (results.length === 0) {
//         throw "API returned an empty array";
//       }
//       await redisClient.set(species, JSON.stringify(results));
//     }

//     res.send({
//       fromCache: isCached,
//       data: results,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(404).send("Data unavailable");
//   }
// }

// app.get("/fish/:species", getSpeciesData);

// app.listen(port, () => {
//   console.log(`App listening on port ${port}`);
// });


// sample get request using node cache

const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");

const app = express();
const port = process.env.PORT || 3000;

// Create a new NodeCache instance
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // Cache with default TTL of 1 hour

async function fetchApiData(species) {
  const apiResponse = await axios.get(
    `https://www.fishwatch.gov/api/species/${species}`
  );
  console.log("Request sent to the API");
  return apiResponse.data;
}

async function getSpeciesData(req, res) {
  const species = req.params.species;
  let results;
  let isCached = false;

  try {
    // Try fetching from the cache
    const cacheResults = cache.get(species);
    if (cacheResults) {
      isCached = true;
      results = cacheResults;
    } else {
      // If no cache, fetch from the API
      results = await fetchApiData(species);
      if (results.length === 0) {
        throw "API returned an empty array";
      }
      // Save the results to cache
      cache.set(species, results);
    }

    res.send({
      fromCache: isCached,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
}

app.get("/fish/:species", getSpeciesData);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
