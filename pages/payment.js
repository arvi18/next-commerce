import Cookies from "js-cookie";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { Store } from "../utils/Store";
import Layout from "../components/Layout";
import CheckoutWizard from "../components/CheckoutWizard";
import useStyles from "../utils/styles";
import {
  Button,
  FormControl,
  FormControlLabel,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import { useSnackbar } from "notistack";

export default function Payment() {
  console.info('🔵 [INFO] Payment - Component mounted');
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const classes = useStyles();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("");
  const { state, dispatch } = useContext(Store);
  const {
    cart: { shippingAddress },
  } = state;

  useEffect(() => {
    console.info('🔵 [INFO] Payment - Checking shipping address');
    if (!shippingAddress.address) {
      console.warn('⚠️ [WARN] Payment - No shipping address found, redirecting to shipping page');
      router.push("/shipping");
    } else {
      console.info('🔵 [INFO] Payment - Setting payment method from cookies');
      const savedPaymentMethod = Cookies.get("paymentMethod");
      console.info('🔵 [INFO] Payment - Saved payment method:', savedPaymentMethod);
      setPaymentMethod(savedPaymentMethod || "");
    }
  }, []);

  const submitHandler = (e) => {
    console.info('🔵 [INFO] Payment - Form submission started');
    closeSnackbar();
    e.preventDefault();
    
    if (!paymentMethod) {
      console.warn('⚠️ [WARN] Payment - No payment method selected');
      enqueueSnackbar("Payment method is required", { variant: "error" });
    } else {
      console.info('🔵 [INFO] Payment - Saving payment method:', paymentMethod);
      dispatch({ type: "SAVE_PAYMENT_METHOD", payload: paymentMethod });
      Cookies.set("paymentMethod", paymentMethod);
      console.info('🔵 [INFO] Payment - Current state before navigation:', {
        paymentMethod,
        cart: state.cart
      });
      console.info('🔵 [INFO] Payment - Attempting to navigate to /placeorder');
      try {
        router.push("/placeorder");
        console.info('✅ [SUCCESS] Payment - Navigation to /placeorder initiated');
      } catch (err) {
        console.error('❌ [ERROR] Payment - Navigation failed:', err);
        console.error('❌ [ERROR] Payment - Error details:', {
          message: err.message,
          stack: err.stack
        });
        enqueueSnackbar("Navigation failed. Please try again.", { variant: "error" });
      }
    }
  };

  return (
    <Layout title="Payment Method">
      <CheckoutWizard activeStep={2}></CheckoutWizard>
      <form className={classes.form} onSubmit={submitHandler}>
        <Typography component="h1" variant="h1">
          Payment Method
        </Typography>
        <List>
          <ListItem>
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="Payment Method"
                name="paymentMethod"
                value={paymentMethod}
                onChange={(e) => {
                  console.info('🔵 [INFO] Payment - Payment method changed to:', e.target.value);
                  setPaymentMethod(e.target.value);
                }}
              >
                <FormControlLabel
                  label="PayPal"
                  value="PayPal"
                  control={<Radio />}
                ></FormControlLabel>
                <FormControlLabel
                  label="Stripe"
                  value="Stripe"
                  control={<Radio />}
                ></FormControlLabel>
                <FormControlLabel
                  label="Cash"
                  value="Cash"
                  control={<Radio />}
                ></FormControlLabel>
              </RadioGroup>
            </FormControl>
          </ListItem>
          <ListItem>
            <Button fullWidth type="submit" variant="contained" color="primary">
              Continue
            </Button>
          </ListItem>
          <ListItem>
            <Button
              fullWidth
              type="button"
              variant="contained"
              onClick={() => {
                console.info('🔵 [INFO] Payment - Going back to shipping page');
                router.push("/shipping");
              }}
            >
              Back
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
}
