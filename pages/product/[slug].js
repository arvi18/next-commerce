import React from "react";
import {
  Link,
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  Button,
} from "@material-ui/core";
import NextLink from "next/link";
import axios from "axios";
import Layout from "../../components/Layout";
import useStyles from "../../utils/styles";
import Image from "next/image";
import db from "../../utils/db";
import { Store } from "../../utils/Store";
import { useContext } from "react";
import Product from "../../models/Product";
import { useRouter } from "next/dist/client/router";

export default function ProductScreen(props) {
  const router=useRouter()
  const { state, dispatch } = useContext(Store);
  const { product } = props;
  const classes = useStyles();
  if (!product) {
    return <div>Product not found</div>;
  }

  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock <quantity) {
      window.alert("Sorry. Product is out of stock");
      return;
    }
    dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    router.push('/cart')
  };

  return (
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
        <NextLink href="/" passHref>
          <Link>Back to Products</Link>
        </NextLink>
      </div>
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography component="h1" variant="h1">
                {product.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Category: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Brand: {product.brand}</Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Rating: {product.rating} stars ({product.numReviews} reviews)
              </Typography>
            </ListItem>
            <ListItem>
              <Typography> Description: {product.description}</Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Price</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>${product.price}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Status</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {product.countInStock > 0 ? "In stock" : "Unavailable"}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={addToCartHandler}
                >
                  Add to cart
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  await db.connect();
  const product = await Product.findOne({ slug }).lean(); // @Server Error: Error: @Error serializing `.products[0]` returned from `getServerSideProps` in "/". @Reason: `object` ("[object Object]") cannot be serialized as JSON. Please only return JSON serializable data types.
  await db.disconnect();
  return {
    props: {
      product: db.convertDocToObj(product),
    },
  };
}

// product: {
//   _id: new ObjectId("617fe575387c6b9aab3f20b9"),
//   name: 'Fit Shirt',
//   slug: 'fit-shirt',
//   category: 'Shirts',
//   image: '/images/shirt2.jpg',
//   price: 80,
//   brand: 'Adidas',
//   rating: 4.2,
//   numReviews: 10,
//   countInStock: 20,
//   description: 'A popular shirt',
//   __v: 0,
//   createdAt: 2021-11-01T13:02:45.303Z,
//   updatedAt: 2021-11-01T13:02:45.303Z
// }