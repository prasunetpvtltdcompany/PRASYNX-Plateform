const jwt = require('../node_modules/jsonwebtoken');
const secret = 'b2cfaea007bad12113ea850536ac3eba85ce2effb345ed1232a85b4ff2952206';
const token = jwt.sign(
  {
    userId: 'f2afc7a1-f4ae-448c-a9ea-533c1db95a7b',
    email: 'arora.family@email.com',
    role: 'parent',
    organisationId: '8b31e8da-1f90-4f34-be4a-f807ea9bc76e',
    sub: 'f2afc7a1-f4ae-448c-a9ea-533c1db95a7b',
  },
  secret,
  { expiresIn: '1h' }
);
console.log(token);
