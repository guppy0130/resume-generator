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

$ node index.js
Usage: index.js -d DATA -t TEMPLATE -o OUTPUT

Options:
  --version       Show version number                                  [boolean]
  -d, --data      your data                                           [required]
  -t, --template  the template                                        [required]
  -o, --output    PDF output                                          [required]
  -g, --tag       tag
  -h, --help      Show help                                            [boolean]

Examples:
  index.js -d content.yml -t                fill out template/aeolyus with
  templates/aeolyus -o output.pdf           content.yml and output a PDF to
                                            output.pdf
  index.js -d content.yml -t                fill out template/aeolyus with
  templates/aeolyus -o output.html          content.yml and output HTML to
                                            output.html

Missing required arguments: d, t, o
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

## Tag Magic ✨✨

If an object has a `tags` key containing an array of values, `-g` will filter that object based on its tag values. That is, given

```yaml
skills:
  - name: Boating
    tags:
      - boat
  - name: Shipping
    tags:
      - logistics
```

And `-g boat`, will output `Boating` for `skills` and not include `Shipping`.

Super handy for putting *all* your data in one place, and then filtering based on job position - tag a `skill` with a `job`, pass `-g JOB`, and build a job-specific resume.

## Template Designing

The following Handlebars helpers are available:

| name           | description                                                                                                                                                            |
|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `descFixer`    | If given an array, returns bulleted list of items. Otherwise, returns what it was given. Good for descriptions.                                                        |
| `stringify`    | If given an array, returns items separated with commas. Otherwise, returns what it was given. Good for lists you want to be represented as a sentence or a singe line. |
| `base64Encode` | Reads in the argument as a filepath (relative to repo root) and converts it to base64. Good for image rendering in PDFs.                                               |
