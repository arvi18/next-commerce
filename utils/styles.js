import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  navbar: {
    background: "#203040",
    "& a": {
      color: "#fff",
      marginLeft: 10,
    },
  },
  brand: {
    fontWeight: "bold",
    fontSize: "1.3rem",
  },
  grow: {
    flexGrow: "1",
  },
  main: {
    minHeight: "80vh",
  },
  footer: {
    textAlign: "center",
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  form:{
    maxWidth:800,
    margin: '0 auto'
  },
  navbarButton:{
    color:'#ffffff',
    textTransform: 'initial'
  },
  transparentBackgroud:{
    background: 'transparent'
  },
  error:{
    color:'f04040'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '2rem',
  },
  errorButton: {
    marginTop: '2rem',
  },
  successContainer: {
    marginTop: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 2,
  },
  successTitle: {
    marginBottom: 4,
    color: 'success.main',
    textAlign: 'center',
  },
  successCard: {
    maxWidth: 600,
    width: '100%',
    padding: 3,
    marginBottom: 4,
    backgroundColor: 'background.paper',
    boxShadow: 4,
  },
});
export default useStyles;