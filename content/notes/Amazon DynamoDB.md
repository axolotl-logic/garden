DynamoDB is a key-value database service provided by [[Amazon Web Services (AWS)]]. 

`Tables` consist of `Items`, which consist of `Attributes`, each a`Key-Value pair`.  An `Item` is uniquely identified in a `Table` by a `Key` which is a subset of `Attributes`. Creating a table requires declaring a `Primary Key` which is a `Key` all items must share.

When data modeling for DynamoDB, some considerations include single-table vs multiple-table design.

#computer-science/aws #computer-science/backend