# How to contribute

Thank you for your interest in contributing to the TeX2Max project.

## How can you help?

* Report issues
* Fix typos and grammar
* Add new rules
* Improve existing rules and workflow

## Best practices

- Bugfixes should only contain changes that are related to the purpose of the bug.
- Description should contain an explanation for the proposed changes.
- It's recommended to consult feature requests with the team before starting implementation
- Send us an email if you need assistance with any work. 

## Making changes

* Fork this repository on [GitHub](https://github.com/KQMATH/tex2max).
* All development work should follow the [GitFlow](https://nvie.com/posts/a-successful-git-branching-model/) branching model.
* Make sure you have added the necessary tests for your changes.
* If applicable, include a link to the issue in the commit message body.

## Submitting changes

* Push your changes to a topic branch in your fork of the repository.
* Submit a pull request to the repository in the [KQMATH GitHub organization](https://github.com/KQMATH)
and choose branch you want to patch (usually develop).
* Add detail about the change to the pull request including screenshots
  if the change affects the UI.

## Reviewing changes

* After submitting a pull request, one of TeX2Max team members will review it.
* Changes may be requested to conform to our style guide and internal
  requirements.
* When the changes are approved and all tests are passing, a TeX2Max team
  member will merge them.
* Note: if you have write access to the repository, do not directly merge pull
  requests. Let another team member review your pull request and approve it.

## Style guide

* This repository uses [Markdown](https://daringfireball.net/projects/markdown/) syntax.
* The preferred spelling of English words is the [American
  English](https://en.wikipedia.org/wiki/American_English) (e.g. behavior, not
  behaviour).

## License

By contributing to this repository you agree that all contributions are subject to the 
GNU General Public License v3.0 under thepublic domain. 
See [LICENSE](https://github.com/KQMATH/tex2max/blob/master/LICENSE)
file for more information.

## Review and release process

* Each addition and rule change is discussed and reviewed internally by TeX2Max
  core team.
* When contents are updated, [CHANGELOG.md](/CHANGELOG.md) file is updated and a
  new tag is released. Repository follows [semantic versioning](http://semver.org/).
* The [official release](https://www.npmjs.com/package/tex2max) at npm must be updated accordingly.
