{
  "targets": [
    {
      "target_name": "module",
      "product_extension": "node",
      "include_dirs" : [ "src" ],
      "conditions": [
        ['OS=="win"', {
          'cflags': [
            '/EHa',
          ],
        },],
      ],
      "sources": [
        "src/module.cc"
      ]
    }
  ]
}