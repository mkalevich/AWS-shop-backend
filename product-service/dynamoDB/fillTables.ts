import { DynamoDB, config } from "aws-sdk";
import { products } from "../mock-db/products";
import { stocks } from "../mock-db/stocks";
import { TABLE_NAME } from "../constants";
import { Product, Stock } from "../mock-db/types";
import * as dotenv from "dotenv";

dotenv.config();

config.update({ region: process.env.BASE_AWS_REGION });

const dynamoDB = new DynamoDB.DocumentClient();

const addItemToTable = (item: Product | Stock, tableName: string) => {
  const params = {
    TableName: tableName,
    Item: item,
  };

  dynamoDB.put(params, (err) => {
    if (err) {
      console.error("Unable to add item!");
    } else {
      console.log("Item has been successfully added!");
    }
  });
};

const addProductsToTable = (products: Product[], tableName: string) => {
  products.forEach((product) => {
    addItemToTable(product, tableName);
  });
};

addProductsToTable(products, TABLE_NAME.PRODUCTS_DB);

const addStocksToTable = (stocks: Stock[], tableName: string) => {
  stocks.forEach((stock) => {
    addItemToTable(stock, tableName);
  });
};

addStocksToTable(stocks, TABLE_NAME.STOCKS_DB);
