import { TIMEOUT_SECOND } from "./config.js";

/**
 * Creates a promise that rejects after a specified time with a timeout error.
 * @param {number} s The number of seconds before the timeout error is triggered.
 * @returns {Promise<never>} A promise that rejects with a timeout error.
 */
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

/**
 * Performs an AJAX request to the specified URL. Can handle both GET and POST requests.
 * @async
 * @param {string} url The URL to send the request to.
 * @param {Object} [uploadData=undefined] The data to be uploaded (for POST requests).
 * @returns {Promise<Object>} A promise that resolves to the response data.
 * @throws Will throw an error if the request fails or takes too long.
 */
const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SECOND)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches JSON data from the specified URL using a GET request.
 * @async
 * @param {string} url The URL to send the request to.
 * @returns {Promise<Object>} A promise that resolves to the response data.
 * @throws Will throw an error if the request fails or takes too long.
 */
// const getJSON = async function (url) {
//   try {
//     const fetchPro = fetch(url);
//     const res = await Promise.race([fetchPro, timeout(TIMEOUT_SECOND)]);
//     const data = await res.json();

//     if (!res.ok) throw new Error(`${data.message} (${res.status})`);

//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

/**
 * Sends JSON data to the specified URL using a POST request.
 * @async
 * @param {string} url The URL to send the request to.
 * @param {Object} uploadData The data to be uploaded.
 * @returns {Promise<Object>} A promise that resolves to the response data.
 * @throws Will throw an error if the request fails or takes too long.
 */
// const sendJSON = async function (url, uploadData) {
//   try {
//     const fetchPro = fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(uploadData),
//     });
//     const res = await Promise.race([fetchPro, timeout(TIMEOUT_SECOND)]);
//     const data = await res.json();

//     if (!res.ok) throw new Error(`${data.message} (${res.status})`);

//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

export { AJAX };
