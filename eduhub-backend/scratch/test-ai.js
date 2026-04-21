const jwt = require('jsonwebtoken');
const axios = require('axios');

const token = jwt.sign({ userId: 'test', role: 'SUPER_ADMIN' }, "031987bbec03a021ac2f8c2de2a2c89a", { expiresIn: '1h' });

axios.post('http://localhost:4000/api/ai/edit-question', {
  editType: 'fix_grammar',
  currentData: {
    question_eng: "Test question",
    explanation_eng: "Test explanation"
  }
}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
}).then(res => console.log(res.data))
  .catch(err => {
    if(err.response) {
       console.error("STATUS:", err.response.status);
       console.error(JSON.stringify(err.response.data, null, 2));
    } else {
       console.error(err);
    }
  });
