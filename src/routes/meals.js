/* const { Router } = require("express");
const router = Router();
let meals = require("../sample.json");

router.get("/", (req, res) => {
  res.status(200).json(meals);
});

router.post("/", (req, res) => {
  console.log(req.body);
  const { meal, price } = req.body;
  const id = meals.length + 1;
  if (meal && price) {
    meals.push({ id: +id, meal: meal, price: +price });
    res.status(201).json({ id: +id, meal: meal, price: +price });
  } else {
    res.status(500).json({ error: "Wrong data" });
  }
});

router.delete("/:id", (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  meals = meals.filter((meal) => meal.id !== +id);
  console.log(meals, "eliminado");
  res.send("eliminado");
});

router.put("/", (req, res) => {
  console.log(req.body);
  const { id, meal, price } = req.body;

  const existIndexMeal = meals.findIndex((item) => item.id === +id);
  const existValue = meals[existIndexMeal];
  if (existValue) {
    const updatedItem = {
      ...existValue,
      meal: meal, price: +price,
    };
    meals[existIndexMeal] = updatedItem;
    console.log(meals, "actualizado");
    res.json(meals);
  } else {
    res.status(500).json({ error: "Wrong data" });
  }
});

module.exports = router;
 */