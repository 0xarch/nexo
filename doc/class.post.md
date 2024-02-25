# Post CLASS

## INTRODUCTION

`Post` is a class which is used by Nexo to describe a post.

## MEMBERS

### raw_string

the raw data from local file.

### content

the posts's content (only content).

### html

the posts's content (after markdown rendering).

### author

the posts's author (might be `undefined`),

### license

**TYPE** `License<Class>`

the license of the post (Private/CreativeCommons/...).

### category

**TYPE** `Array<string>`

**WARNING** this might be renamed as `categories`

the posts's categories

### tags

**TYPE** `Array<string>`

the posts's tags

### id

**TYPE** `number`

**NOTE** This is generated by Nexo. If you are developing a theme, do not change this value.

the posts's id, each posts has the only id.

### date

**TYPE** `Date`

the posts's post date.

### ECMA262Date

**TYPE** `string`

### isTopped

**TYPE** `boolean`

**WARNING** this might be renamed as `topped`