//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require ("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://dron:gotinpich09@cluster0.re9rrdw.mongodb.net/todolistDB?retryWrites=true&w=majority');

const ItemsSchema = new mongoose.Schema( {
  item: String
});

const Item = mongoose.model("Item", ItemsSchema);

const buyFood = new Item({
  item: "Buy Food"
})
const cookFood = new Item({
  item: "Cook Food"
})
const eatFood = new Item({
  item: "Eat Food"
})

const defaultItems = [buyFood,cookFood,eatFood];

const listSchema = {
  name: String,
  items: [ItemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err,foundItems){
    if (foundItems.length === 0) { 
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log("Error inserting");
        } else {
        }
      })
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.get("/:customListName", function(req,res){

  const customListName =_.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,result){
    if(!err){
      if(!result){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();

        res.redirect("/"+customListName);
      }
      else{
        res.render("list", {listTitle:result.name, newListItems: result.items})
      }
    }
  })
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    item: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName;
  
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        res.redirect("/");
      }
    })
    
  } else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItemId} } },function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
