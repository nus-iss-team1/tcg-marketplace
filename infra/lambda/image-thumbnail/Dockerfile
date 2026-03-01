FROM public.ecr.aws/lambda/nodejs:18

# copy package files
COPY package*.json ./

# install dependencies
RUN npm install

# copy sourcecode
COPY index.js ./

# command for lambda
CMD ["index.handler"]
