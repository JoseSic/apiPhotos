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

  console.log(newAlbumArray, newData.length);

  /* const titleArray = ["sic", "canil"];
  const photosFilter = [
    { title: "jose" },
    { title: "luis sic" },
    { title: "alejandra sic" },
  ].filter((photoItem) => {
    for (let i = 0; i < titleArray.length; i++) {
      console.log(i, "for",photoItem.title);
      if (!photoItem.title.includes(titleArray[i].trim())) {
        return false;
      }
    }
    return true;
  }); */

  /*   const albumItemIsValid = albums.filter(
      (itemAlbum) => +itemAlbum.id === +photoItem.albumId
    );
    console.log(photoItem, albumItemIsValid);
    if (albumItemIsValid.length === 0) {
      return false;
    }
    const userItemIsValid = users.filter(
      (itemUser) => +itemUser.id === +albumItemIsValid[0].userId
    );
    if (userItemIsValid.length === 0) {
      return false;
    }
    return false;  */
  /*   .map((itemNewData) => {
      const albumItem = albums.filter(
        (itemAlbum) => +itemAlbum.id === +itemNewData.albumId
      );

      const userItem = users.filter(
        (itemUser) => +itemUser.id === +albumItem[0].userId
      );
      return {
        id: itemNewData.id,
        title: itemNewData.title,
        url: itemNewData.url,
        thumbnailUrl: itemNewData.thumbnailUrl,
        albumItem: {
          Id: albumItem[0].id,
          title: albumItem[0].title,
          user: { ...userItem[0] },
        },
      };
    }); */

  return newData;
};

const titleFilter = (photosData, titleArray) => {
  if (!titleArray) {
    return photosData;
  }

  /*  const photosFilter = photosData.filter((ph) => {
    if (titleArray.some((ta) => !ph.title.includes(ta.trim()))) {
      return false;
    }
    return true;
  }); */

  const photosFilter = photosData.filter((photoItem) =>
    titleArray.every((titleItem) => photoItem.title.includes(titleItem.trim()))
  );
  /* const photosFilter = photosData.filter((photoItem) => {
    for (let i = 0; i < titleArray.length; i++) {
      if (!photoItem.title.includes(titleArray[i].trim())) {
        return false;
      }
    }
    return true;
  }); */
  return photosFilter;
};

const albumTitleFilter = (albumsData, albumTitleArray) => {
  if (!albumTitleArray) {
    return albumsData;
  }

  const albumFilter = albumsData.filter((albumItem) =>
    albumTitleArray.every((albumTitleItem) =>
      albumItem.title.includes(albumTitleItem.trim())
    )
  );

  /* const albulmsFilter = albumsData.filter((item) => {
    for (let i = 0; i < albumTitleArray.length; i++) {
      if (!item.title.includes(albumTitleArray[i].trim())) {
        return false;
      }
    }
    return true;
  }); */
  return albumFilter;
};

const albumUserEmailFilter = (usersData, albumUserEmail) => {
  if (!albumUserEmail) {
    return usersData;
  }
  const userFilter = usersData.filter(
    (item) => item.email.trim() === albumUserEmail.trim()
  );

  return userFilter;
};

const dtaPagination = (offset, limit, dataArray) => {
  //tiene que ser desde la posicicion donde se quiere empezar a recoger los datos
  let newData = [];
  //const newData = [13, 260, 318, 577, 4315];
  /* let limitArray = (offset) + (limit);
  limitArray = limitArray >= dataArray.length ? dataArray.length : limitArray;
 console.log(limitArray)
  for (let index = offset; index < limitArray; index++) {
    newData.push(dataArray[index]);
  }
  console.log(newData);  */

  //aqui limit, debe de de ser un limit acumulado

  let limitArray = limit + offset;
  limitArray = limitArray > dataArray.length  ? dataArray.length  : limitArray;

  newData = dataArray.slice(offset, limitArray);
  console.log("offset", dataArray.slice(offset, limitArray));
  console.log("offset", dataArray.slice(offset, limitArray));
  return newData;
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
        console.log(errors);
      });

    const title = req.query.title;
    const titleArray = title ? title.trim().split(" ") : null;
    const albumTitle = req.query["album.title"];
    const albumTitleArray = albumTitle ? albumTitle.trim().split(" ") : null;
    const albumUserEmail = req.query["album.user.email"];
    const offsetIsValid = req.query.offset;
    const offset = offsetIsValid ? +offsetIsValid : 0;
    const limitIsValid = req.query.limit;
    const limit = limitIsValid ? +limitIsValid : 25;

    const photosFilter = titleFilter(photosData, titleArray);
    const albumsFilter = albumTitleFilter(albumsData, albumTitleArray);
    const userFilter = albumUserEmailFilter(usersData, albumUserEmail);

    const newData = transformedData(userFilter, albumsFilter, photosFilter);
    const dataOffset = dtaPagination(offset, limit, newData);
    res.status(200).json(dataOffset);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "error" });
  }
});

router.post("/", (req, res) => {
  //   console.log(req.body);
  //   const { meal, price } = req.body;
  //   const id = meals.length + 1;
  //   if (meal && price) {
  //     meals.push({ id: +id, meal: meal, price: +price });
  //     res.status(201).json({ id: +id, meal: meal, price: +price });
  //   } else {
  //     res.status(500).json({ error: "Wrong data" });
  //}
});

module.exports = router;
