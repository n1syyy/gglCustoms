import React, {useState, useEffect} from 'react'
import { Col, Row, ListGroup, Image, Card, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import CheckoutSteps from '../components/CheckoutSteps'
import { createOrder } from '../actions/orderActions'
import { ORDER_CREATE_RESET } from '../constants/orderConstants'


function PlaceOrderScreen() {
    const orderCreate = useSelector(state => state.orderCreate)
    const { order, error, success } = orderCreate

    const dispatch = useDispatch()
    const history = useNavigate()

    const cart = useSelector(state => state.cart)

    cart.itemsPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
    cart.shippingPrice = (cart.itemsPrice > 100 ? 0 : 10).toFixed(2)
    cart.taxPrice = Number((0.01) * cart.itemsPrice).toFixed(2)
    cart.totalPrice = (Number(cart.itemsPrice) + Number(cart.shippingPrice) + Number(cart.taxPrice)).toFixed(2)



    if(!cart.paymentMethod){
        history('/payment/')
    }

    useEffect(() => {
        if(success){
             history(`/orders/${order._id}`)
             dispatch({
                 type: ORDER_CREATE_RESET
             })
        }
    }, [success, history, dispatch, order])

    const placeOrder = () => {
        dispatch(createOrder({
            orderItems: cart.cartItems,
            shippingAddress: cart.shippingAddress,
            paymentMethod: cart.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
    
        }))
    }

    return (
        <div>
            <CheckoutSteps step1 step2 step3 step4 />
            <Row>
                <Col md={8}>
                    <ListGroup variant='flush'>

                        <ListGroup.Item>
                            <h2>
                                <strong>Shipping</strong>
                            </h2>

                            <p>
                                <strong>Shipping Address: </strong>
                                {cart.shippingAddress.address}, {cart.shippingAddress.city}
                                {'   '}
                                {cart.shippingAddress.postalCode},
                                {'   '}
                                {cart.shippingAddress.country}
                                {'   '}
                            </p>
                        </ListGroup.Item>
                        
                        <ListGroup.Item>
                            <h2>
                                <strong>Payment Method</strong>
                            </h2>

                            <p>
                                <strong>Method: </strong>
                                {cart.paymentMethod}
                            </p>
                        </ListGroup.Item>
                        
                        <ListGroup.Item>
                                <h2>Order Items</h2>
                                {cart.cartItems.length === 0 ? <Message variant='info'>
                                    Yo cart is empty
                                </Message> : (
                                    <ListGroup variant='flush'>
                                        {cart.cartItems.map((item, index) => (
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
                                    <Col>${cart.itemsPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping:</Col>
                                    <Col>${cart.shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax:</Col>
                                    <Col>${cart.taxPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax:</Col>
                                    <Col>${cart.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                {error && <Message variant='danger'>{error}</Message>}
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Button type='button' className='btn-block' disabled={cart.cartItems === 0} onClick={placeOrder}>
                                    Place Order
                                </Button>
                            </ListGroup.Item>
                        
                        </ListGroup>
                    
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default PlaceOrderScreen
