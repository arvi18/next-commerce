import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import {
  Typography,
  Button,
  Container,
  Box,
} from '@material-ui/core';
import useStyles from '../utils/styles';

function Error({ statusCode }) {
  const router = useRouter();
  const classes = useStyles();

  console.error('Error page rendered:', {
    statusCode,
    path: router.asPath,
    query: router.query,
  });

  return (
    <Layout title="Error">
      <Container>
        <Box className={classes.errorContainer}>
          <Typography variant="h1" component="h1">
            {statusCode
              ? `An error ${statusCode} occurred on server`
              : 'An error occurred on client'}
          </Typography>
          <Typography variant="body1" component="p">
            {statusCode === 404
              ? 'The page you are looking for does not exist.'
              : 'Something went wrong. Please try again later.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/')}
            className={classes.errorButton}
          >
            Go to Homepage
          </Button>
        </Box>
      </Container>
    </Layout>
  );
}

Error.getInitialProps = ({ res, err }) => {
  console.error('Error getInitialProps:', {
    statusCode: res?.statusCode,
    err: err?.message,
    stack: err?.stack,
  });

  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 