const mysql = require("mysql2");
const db = require("./db/db");

const UserModel = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: "Ce username est déjà pris." },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
};

export { UserModel };
