import { Row, Col } from 'antd';
import './App.css';
import RTE from './RTE';

const App = () => {
  return (
    <>
      <Row style={{ marginTop: '6rem' }}>
        <Col span={8}></Col>
        <Col span={8}>
          <RTE />
        </Col>
        <Col span={8}></Col>
      </Row>
    </>
  );
};

export default App;
