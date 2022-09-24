# SQL client sample

Nowadays there're many SQL client libraries including ORM mapper as open sources which make our application developing more productive.
But most of them don't pay attention to keep application entity type safety that it has a chance to lead to crucial incidents.

So this repository will contribute to applications which have to keep it type safety applications.

# Let's just give a try

Run PostgreSQL Docker at first.

```sh
cd test/dvdrental
./do.sh build
./do.sh ci
```

run the scripts to generate TypeScript Schema using io-ts

```sh
yarn scripts
```
