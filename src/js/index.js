
const _ = require('lodash')

const hello = () => {
  var users = [
    {
      'user': 'aaron',
      'show': true
    },
    {
      'user': 'tom',
      'age': 40,
      'show': false
    }
  ]

  var user = _.filter(users, function (o) {
    return o.show
  })

  console.log(user)
}

hello()
