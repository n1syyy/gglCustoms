import React, {useState, useEffect} from 'react'
import { Col, Row, ListGroup, Image, Card, Button } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { PayPalButton } from 'react-paypal-button-v2'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getOrderDetails, payOrder, deliverOrder } from '../actions/orderActions'
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants'


function OrderScreen() {

    const { id } = useParams()
    const history = useNavigate()
    const dispatch = useDispatch()

    const [sdkReady, setSdkReady] = useState(false)

    const orderDetails = useSelector(state => state.orderDetails)
    const { order, error, loading } = orderDetails
    
    const orderPay = useSelector(state => state.orderPay)
    const { loading: loadingPay, success: successPay } = orderPay
    
    const orderDeliver = useSelector(state => state.orderDeliver)
    const { loading: loadingDeliver, success: successDeliver } = orderDeliver
    
    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin
    
    if(!loading && !error){
        order.itemsPrice = order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
    }

    


    const addPayPalScript = () => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = 'https://www.paypal.com/sdk/js?client-id=AT8nJtQ03FlgOk84CbKMc1XfosLWtOh67mxuib7fNZNhRdY46cZgGjxIIVrahpmUDQ7tz0W2i4sFWE6h'
        script.async = true
        script.onload = () => {
            setSdkReady(true)
        }
        document.body.appendChild(script)
    }


    useEffect(() => {

        if(!userInfo){
            history('/login')
        }

        if (!order || successPay || order._id !== Number(id) || successDeliver){
            dispatch({ type: ORDER_PAY_RESET })
            dispatch({ type: ORDER_DELIVER_RESET })
            dispatch(getOrderDetails(id))

        } else if (!order.isPaid) {
            if  (!window.paypal) {
                addPayPalScript()
            } else {
                setSdkReady(true)
            }
        }

    }, [dispatch, order, id, successPay, successDeliver, history, userInfo])

    const successPaymentHandler = (paymentResult) => {
        dispatch(payOrder(id, paymentResult))
    }

    const deliverHandler = () => {
        dispatch(deliverOrder(order))
    }


    return loading ? (
        <Loader />
    ) : error ? (
        <Message variant='danger'>{error}</Message>
    ) : (
            <div>
                <h1>Order: {order._id}</h1>
                <Row>
                    <Col md={8}>
                        <ListGroup variant='flush'>

                            <ListGroup.Item>
                                <h2>
                                    <strong>Shipping</strong>
                                </h2>

                                <p><strong>Name: </strong> {order.user.name}</p>
                                <p><strong>Email: </strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>

                                <p>
                                    <strong>Shipping Address: </strong>
                                    {order.shippingAddress.address}, {order.shippingAddress.city}
                                    {'   '}
                                    {order.shippingAddress.postalCode},
                                    {'   '}
                                    {order.shippingAddress.country}
                                    {'   '}
                                </p>

                                
                                {order.isDelivered ? (
                                    <Message variant='success'>Delivered at: {order.deliveredAt}</Message>
                                ) : (
                                    <Message variant='warning'>Yet to be delivered</Message>
                                )}


                            </ListGroup.Item>
                            
                            <ListGroup.Item>
                                <h2>
                                    <strong>Payment Method</strong>
                                </h2>

                                <p>
                                    <strong>Method: </strong>
                                    {order.paymentMethod}
                                </p>

                                {order.isPaid ? (
                                    <Message variant='success'>Paid on: {order.paidAt}</Message>
                                ) : (
                                    <Message variant='warning'>Not Paid</Message>
                                )}
                                
                            </ListGroup.Item>
                            
                            <ListGroup.Item>
                                    <h2>Order Items</h2>
                                    {order.orderItems.length === 0 ? <Message variant='info'>
                                        Yo order is empty
                                    </Message> : (
                                        <ListGroup variant='flush'>
                                            {order.orderItems.map((item, index) => (
                                                <ListGroup.Item key={index}>
                                                    <Row>
                                                        <Col md={2}>
                                                            <Image src={item.image} alt={item.name} fluid rounded />
                                                        </Col>

                                                        <Col>
                                                            <Link to={`/product/${item.productId}`}>{item.name}</Link>
                                                        </Col>

                                                        <Col md={4}>
                                                            {item.qty} X ${item.price} = ${(item.qty * item.price).toFixed(2)}
                                                        </Col>
                                                    </Row>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}

                            </ListGroup.Item>

                        </ListGroup>
                    </Col>

                    <Col md={4}>
                        <Card>
                            <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <h2>Order Summary</h2>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Items price:</Col>
                                        <Col>${order.itemsPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Shipping:</Col>
                                        <Col>${order.shippingPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Tax:</Col>
                                        <Col>${order.taxPrice}</Col>
                                    </Row>
                                </ListGroup.Item>

                                <ListGroup.Item>
                                    <Row>
                                        <Col>Total:</Col>
                                        <Col>${order.totalPrice}</Col>
                                    </Row>
                                </ListGroup.Item>
                                
                                {!order.isPaid && (

                                    <ListGroup.Item>
                                        {loadingPay && <Loader/>}

                                        {!sdkReady ? (
                                            <Loader/>
                                        ) : (
                                            <PayPalButton 
                                                amount = {order.totalPrice}
                                                onSuccess = {successPaymentHandler}
                                            />
                                        )}
                                    </ListGroup.Item>
                            
                                )}
                            </ListGroup>
                            
                            {loadingDeliver && <Loader />}
                            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                                <ListGroup.Item>
                                    <Button type='button' className='btn btn-block' onClick={deliverHandler}>
                                        Mark as delivered
                                    </Button>
                                </ListGroup.Item>
                            )}
                        
                        </Card>
                    </Col>
                </Row>
            </div>
    )
}

export default OrderScreen
