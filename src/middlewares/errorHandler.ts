// eslint-disable-next-line no-unused-vars
export default (error: any, req: any, res: any, next: any) => {
  const status = error.statusCode || 500;
  const { message } = error;
  const { data } = error;
  res.status(status).json({ message, data });
};
