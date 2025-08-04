# resume-generator

```text
tired: updating multiple copies of your resume manually
wired: automating updating multiple copies of your resume
```

Give it a template + some YAML and output a resume. Amazing.

## Installing

```console
$ npm i
<npm output>

$ ts-node index.ts
Usage: index.ts -d DATA -t TEMPLATE -o OUTPUT

Options:
  -d, --data      your data                                  [string] [required]
  -t, --template  template to use                            [string] [required]
  -o, --output    output file (.pdf, .html)                  [string] [required]
  -p, --position  position to filter for                                [string]
  -h, --help      Show help                                            [boolean]
  -v, --version   Show version number                                  [boolean]

Examples:
  index.ts -d content.yml -t                fill out template/aeolyus with
  templates/aeolyus -o output.pdf           content.yml and output a PDF to
                                            output.pdf
  index.ts -d content.yml -t                fill out template/aeolyus with
  templates/aeolyus -o output.html          content.yml and output HTML to
                                            output.html

Missing required arguments: data, template, output
```

## Using

### Single Data File Example

Suggested YAML structure (works with default templates!):

```yaml
# content.yml
---
name: Boaty McBoatFace
description: I am a boat
location:
  city: Venice
contact:
  phone: 1-877-BOAT-4-KIDS
  email: mcboaty@boatfaces.com
  website: mcboaty.com
  github: mcboaty
  linkedin: mcboaty
education:
  - name: University of California, Boatly
    major: Marine Science
    dates:
      start: 2017
      end: 2020
    classes:
      - name: Piracy 101
      - name: Astronomy 101
experience:
  - name: Atlantic Ocean
    position: Big Head
    dates:
      start: 2020-06-06
      end: 2020-08-08
    description: >-
      The Big Head will work with other Heads to do boat things.
projects:
  - name: Community service at Boats For Kids
    url: https://communityhelp.boat
    description: >-
      1-877-BOAT-4-KIDS. B-O-A-T, Boat for Kids. 1-877-BOAT-4-KIDS. Donate your
      boat today.
skills:
  - name: Boating
  - name: Shipping
```

Pass `-d content.yml` to select this file.

### Multi Data File Example

You can also choose to break up the root-level keys across multiple files, and pass a folder to `-d` to parse all files in that folder.

For example:

```yaml
# data/basics.yml
---
name: Boaty McBoatFace
description: I am a boat
location:
  city: Venice
contact:
  phone: 1-877-BOAT-4-KIDS
  email: mcboaty@boatfaces.com
  website: mcboaty.com
  github: mcboaty
  linkedin: mcboaty
```

```yaml
# data/education.yml
---
education:
  - name: University of California, Boatly
    major: Marine Science
    dates:
      start: 2017
      end: 2020
    classes:
      - name: Piracy 101
      - name: Astronomy 101
```

```yaml
# data/experience.yml
---
experience:
  - name: Atlantic Ocean
    position: Big Head
    dates:
      start: 2020-06-06
      end: 2020-08-08
    description: >-
      The Big Head will work with other Heads to do boat things.
```

```yaml
# data/projects.yml
---
projects:
  - name: Community service at Boats For Kids
    url: https://communityhelp.boat
    description: >-
      1-877-BOAT-4-KIDS. B-O-A-T, Boat for Kids. 1-877-BOAT-4-KIDS. Donate your
      boat today.
```

```yaml
# data/skills.yml
---
skills:
  - name: Boating
  - name: Shipping
```

Then pass `-d data` to combine all `data/*.yml` files into a single object. These two examples are equivalent.

## Position Magic ✨✨

If an object has a `positions` key containing an array of values, `-p` will
filter that object based on its `positions` values. That is, given:

```yaml
skills:
  - name: Boating
    positions:
      - boat
      - logistics
  - name: Shipping
    positions:
      - logistics
```

* `-p boat` will output `Boating` for `skills` and not include `Shipping`.
* `-p logistics` will output both skills, because `logistics` is present in both

Super handy for putting *all* your data in one place, and then filtering based
on position - tag a `skill` with a `position`, pass `-p POSITION`, and build a
position-specific resume.

## Template Designing

The following Handlebars helpers are available:

| name           | description                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `descFixer`    | If given an array, returns `ul` list of items. Otherwise, returns what it was given.                   |
| `stringify`    | If given an array, returns items' `.name` separated with commas. Otherwise, returns what it was given. |
| `base64Encode` | Reads in the argument as a filepath (relative to repo root) and converts it to base64.                 |
| `first`        | Returns first N (default 1) items in an array                                                          |
| `random`       | Returns random N (default 1) items in an array                                                         |
