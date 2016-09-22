const target = (process.env.TARGET || "local")

console.log("Node", process.env.NODE_ENV)

const environments = {
  local: {
    NODE_ENV:  process.env.NODE_ENV,
    namingScheme: "",
    uglify: false,
    API_URL: "",
    BASE_URL: "",
  },
  production: {
    NODE_ENV:  process.env.NODE_ENV,
    namingScheme: "-[hash]",
    uglify: true,
    API_URL: "",
    BASE_URL: "",
  },
}

module.exports = environments[target]