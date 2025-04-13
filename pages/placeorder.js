import React, { useContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import { Store } from "../utils/Store";
import NextLink from "next/link";
import Image from "next/image";
import {
  Grid,
  TableContainer,
  Table,
  Typography,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Link,
  CircularProgress,
  Button,
  Card,
  List,
  ListItem,
  Box,
} from "@material-ui/core";
import axios from "axios";
import { useRouter } from "next/router";
import useStyles from "../utils/styles";
import CheckoutWizard from "../components/CheckoutWizard";
import { useSnackbar } from "notistack";
import { getError } from "../utils/clientError";
import Cookies from "js-cookie";

function PlaceOrder() {
  console.info('🔵 [INFO] PlaceOrder - Component mounted');
  const classes = useStyles();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    userInfo,
    cart: { cartItems, shippingAddress, paymentMethod },
  } = state;
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  console.info('🔵 [INFO] PlaceOrder - Current state:', {
    hasUserInfo: !!userInfo,
    cartItemsCount: cartItems.length,
    hasShippingAddress: !!shippingAddress,
    paymentMethod
  });

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  const itemsPrice = round2(
    cartItems.reduce((a, c) => a + c.price * c.quantity, 0)
  );
  const shippingPrice = itemsPrice > 200 ? 0 : 15;
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    console.info('🔵 [INFO] PlaceOrder - Checking prerequisites');
    if (!paymentMethod) {
      console.warn('⚠️ [WARN] PlaceOrder - No payment method found, redirecting to payment page');
      router.push("/payment");
    }
    if (cartItems.length === 0 && !orderSuccess) {
      console.warn('⚠️ [WARN] PlaceOrder - Cart is empty, redirecting to cart page');
      enqueueSnackbar('Your cart is empty. Please add items to your cart before placing an order.', { 
        variant: 'warning',
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        }
      });
      router.push("/cart");
    }
  }, [cartItems.length, paymentMethod, router, enqueueSnackbar, orderSuccess]);

  const placeOrderHandler = async () => {
    console.info('🔵 [INFO] PlaceOrder - Starting order placement');
    closeSnackbar();
    
    try {
      console.info('🔵 [INFO] PlaceOrder - Order data:', {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      });
      
      if (!userInfo?.token) {
        console.error('❌ [ERROR] PlaceOrder - No user token found');
        throw new Error('User authentication required');
      }
      
      console.info('🔵 [INFO] PlaceOrder - User token available');
      setLoading(true);
      
      console.info('🔵 [INFO] PlaceOrder - Making API request to /api/orders');
      const { data } = await axios.post(
        "/api/orders",
        {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      
      console.info('✅ [SUCCESS] PlaceOrder - Order created successfully:', data);
      
      if (!data._id) {
        console.error('❌ [ERROR] PlaceOrder - Order created but no ID returned');
        throw new Error('Order creation response missing ID');
      }

      // Store order data and show success state
      setPlacedOrder(data);
      setOrderSuccess(true);
      
      // Store order ID in localStorage before clearing cart
      localStorage.setItem('lastOrderId', data._id);
      
      // Clear cart and update state
      dispatch({ type: "CART_CLEAR" });
      Cookies.remove("cartItems");
      setLoading(false);
      
      // Show success message
      enqueueSnackbar('Order placed successfully!', { variant: 'success' });
      
      // Auto-navigate after 5 seconds
      setTimeout(() => {
        router.replace(`/order/${data._id}`);
      }, 5000);
      
    } catch (err) {
      setLoading(false);
      console.error('❌ [ERROR] PlaceOrder - Order placement failed:', err);
      console.error('❌ [ERROR] PlaceOrder - Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  };

  if (orderSuccess && placedOrder) {
    return (
      <Layout title="Order Placed Successfully">
        <CheckoutWizard activeStep={3}></CheckoutWizard>
        <Box className={classes.successContainer}>
          <Typography variant="h3" className={classes.successTitle}>
            🎉 Order Placed Successfully!
          </Typography>
          <Card className={classes.successCard}>
            <List>
              <ListItem>
                <Typography variant="h4">Order Details</Typography>
              </ListItem>
              <ListItem>
                <Typography>Order ID: {placedOrder._id}</Typography>
              </ListItem>
              <ListItem>
                <Typography>Total Amount: ${placedOrder.totalPrice}</Typography>
              </ListItem>
              <ListItem>
                <Typography>Payment Method: {placedOrder.paymentMethod}</Typography>
              </ListItem>
              <ListItem>
                <Typography>Shipping to: {placedOrder.shippingAddress.address}, {placedOrder.shippingAddress.city}</Typography>
              </ListItem>
              <ListItem>
                <Typography variant="h5" style={{ marginTop: '1rem' }}>Order Items:</Typography>
              </ListItem>
              {placedOrder.orderItems.map((item) => (
                <ListItem key={item._id}>
                  <Grid container spacing={2}>
                    <Grid item xs={2}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{item.name}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography>Qty: {item.quantity}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography>${item.price}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
              <ListItem>
                <Typography style={{ marginTop: '1rem' }}>
                  You will be redirected to your order details page in a few seconds...
                </Typography>
              </ListItem>
            </List>
          </Card>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Shopping Cart">
      <CheckoutWizard activeStep={3}></CheckoutWizard>
      <Typography component="h1" variant="h1">
        Place Order
      </Typography>

      <Grid container spacing={1}>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Shipping Address
                </Typography>
              </ListItem>
              <ListItem>
                {shippingAddress.fullName}, {shippingAddress.address},{" "}
                {shippingAddress.city}, {shippingAddress.postalCode},{" "}
                {shippingAddress.country}
              </ListItem>
            </List>
          </Card>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Payment Method
                </Typography>
              </ListItem>
              <ListItem>{paymentMethod}</ListItem>
            </List>
          </Card>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  Order Items
                </Typography>
              </ListItem>
              <ListItem>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <NextLink href={`/product/${item.slug}`} passHref>
                              <Link>
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={50}
                                  height={50}
                                ></Image>
                              </Link>
                            </NextLink>
                          </TableCell>

                          <TableCell>
                            <NextLink href={`/product/${item.slug}`} passHref>
                              <Link>
                                <Typography>{item.name}</Typography>
                              </Link>
                            </NextLink>
                          </TableCell>
                          <TableCell align="right">
                            <Typography>{item.quantity}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography>${item.price}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ListItem>
            </List>
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography variant="h2">Order Summary</Typography>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Items:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">${itemsPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Tax:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">${taxPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Shipping:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">${shippingPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Total:</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">
                      <strong>${totalPrice}</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  onClick={placeOrderHandler}
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress /> : "Place Order"}
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(PlaceOrder), { ssr: false });
