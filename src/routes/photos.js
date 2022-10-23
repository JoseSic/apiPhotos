const { Router } = require("express");
const router = Router();
const axios = require("axios");

const transformedData = (users, albums, photos) => {
  if (users.length === 0 || albums.length === 0 || photos.length === 0) {
    return [];
  }
  const newAlbumArray = albums.filter((albumItem) =>
    users.some((userItem) => albumItem.userId == userItem.id)
  );

  const newData = photos
    .filter((photoItem) =>
      newAlbumArray.some((albumItem) => photoItem.albumId == albumItem.id)
    )
    .map((photoItem) => {
      const albumIndex = newAlbumArray.findIndex(
        (item) => item.id === photoItem.albumId
      );
      const albumItem = newAlbumArray[albumIndex];
      const userIndex = users.findIndex((item) => item.id === albumItem.userId);
      const userItem = users[userIndex];

      return {
        id: photoItem.id,
        title: photoItem.title,
        url: photoItem.url,
        thumbnailUrl: photoItem.thumbnailUrl,
        albumItem: {
          Id: albumItem.id,
          title: albumItem.title,
          user: { ...userItem },
        },
      };
    });

  return newData;
};

const dataFilter = (data, filter) => {
  if (!filter) {
    return data;
  }
  const newData = data.filter((item) =>
    item.title.trim().includes(filter.trim())
  );

  return newData;
};

const albumUserEmailFilter = (usersData, albumUserEmailFilter) => {
  if (!albumUserEmailFilter) {
    return usersData;
  }
  const newData = usersData.filter(
    (item) => item.email.trim() === albumUserEmailFilter.trim()
  );

  return newData;
};

const dataPagination = (offset, limit, dataArray) => {
  let newData = [];
  let numberOfPages = 0;
  let currentPage = 1;
  const dataPhotos = {
    pages: numberOfPages,
    offset: offset,
    limit: limit,
    currentPage: currentPage,
    photos: [],
  };
  
  if (dataArray.length === 0 || !dataArray) {
    return dataPhotos;
  }

  numberOfPages = Math.ceil(dataArray.length / limit);
  currentPage = offset === 0 ? 1 : Math.ceil((offset + limit) / limit);
  let limitArray = limit + offset;
  limitArray = limitArray > dataArray.length ? dataArray.length : limitArray;

  newData = dataArray.slice(offset, limitArray);
  dataPhotos.pages = numberOfPages;
  dataPhotos.currentPage = currentPage;
  dataPhotos.photos = newData;
  return dataPhotos;
};

router.get("/", async (req, res) => {
  try {
    const users = axios.get("https://jsonplaceholder.typicode.com/users");
    const albums = axios.get("https://jsonplaceholder.typicode.com/albums");
    const photos = axios.get("https://jsonplaceholder.typicode.com/photos");
    let usersData;
    let albumsData;
    let photosData;
    await axios
      .all([users, albums, photos])
      .then(
        axios.spread((...responses) => {
          usersData = responses[0].data;
          albumsData = responses[1].data;
          photosData = responses[2].data;
        })
      )
      .catch((errors) => {
        throw new Error(errors.message);
      });

    const title = req.query.title;
    const albumTitle = req.query["album.title"];
    const albumUserEmail = req.query["album.user.email"];
    const offsetIsValid = req.query.offset;
    const offset = req.query.offset ? +req.query.offset : 0;
    const limitIsValid = req.query.limit;
    const limit = req.query.limit ? +req.query.limit : 25;

    const photosFilter = dataFilter(photosData, title);
    const albumsFilter = dataFilter(albumsData, albumTitle);
    const userFilter = albumUserEmailFilter(usersData, albumUserEmail);

    const newData = transformedData(userFilter, albumsFilter, photosFilter);
    const dataPage = dataPagination(offset, limit, newData);
    res.status(200).json(dataPage);
  } catch (error) {
    res
      .status(500)
      .json({ error: `error: request not processed. info: ${error.message}` });
  }
});

module.exports = router;
