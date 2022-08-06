import React, { useContext } from "react";
import { Store } from "../utils/Store";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/dist/client/router";
import axios from "axios";
import { Link } from "@material-ui/core";
import {
  Grid,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Select,
  Button,
  Card,
  List,
  ListItem,
} from "@material-ui/core";

function CartScreen() {
  const { state, dispatch } = useContext(Store);
  const { cartItems } = state.cart;
  const router = useRouter();

  const updatecartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);

    if (data.countInStock < quantity) {
      window.alert("Sorry. Product is out of stock");
      return;
    }
    dispatch({ type: "CART_ADD_ITEM", payload: { ...item, quantity } });
  };
  const removeItemHandler = (item) => {
    console.log("done");
    dispatch({ type: "CART_REMOVE_ITEM", payload: item });
  };
  const checkoutHandler = () => router.push("/shipping");

  return (
    <Layout title="Your cart">
      <Typography variant="h1" component="h1" color="primary">
        Shopping Cart
      </Typography>
      {cartItems.legth === 0 ? (
        <div>
          Cart is empty!<NextLink href="/">Go shopping</NextLink>
        </div>
      ) : (
        <Grid container spacing={1}>
          <Grid item md={9} xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="left">Quantity</TableCell>
                    <TableCell align="left">Price</TableCell>
                    <TableCell align="left">Action</TableCell>
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
                              alt={item.slug}
                              width={50}
                              height={50}
                            ></Image>
                          </Link>
                        </NextLink>
                      </TableCell>
                      <TableCell align="left">
                        <NextLink href={`/product/${item.slug}`} passHref>
                          <Link>{item.name}</Link>
                        </NextLink>
                      </TableCell>

                      {/* const range = (left, stop, step) => Array.from({ length: (stop - left) / step + 1}, (_, i) => left + (i * step)); */}
                      {/* range(1,5,1)=[1,2,3,4,5] */}
                      {/* const range = function*(from,to) { for(let i = from; i <= to; i++) yield I;}; [...range(3,5)]// => [3, 4, 5] */}

                      <TableCell align="left">
                        <Select
                          value={item.quantity}
                          onChange={(e) =>
                            updatecartHandler(item, e.target.value)
                          }
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <MenuItem key={x + 1} value={x + 1} align="left">
                              {x + 1}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell align="left">{item.price}</TableCell>
                      <TableCell align="left">
                        <Button
                          variant="text"
                          onClick={() => removeItemHandler(item)}
                        >
                          ❎
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item md={3} xs={12}>
            <Card>
              <List>
                <ListItem>
                  <Typography variant="h2">
                    Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}{" "}
                    items) : $
                    {cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
                  </Typography>
                </ListItem>
                <ListItem>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={checkoutHandler}
                  >
                    Check Out
                  </Button>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}

// render page in client side
// do not intend to expose this page to crawlers
export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });
