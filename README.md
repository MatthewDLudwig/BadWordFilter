# BadWordFilter
Factory function for creating filters to remove certain words from a string.  Can handle whitespace in words automatically.  Specifically doesn't handle repeated letters in words, this could be added in the future though there are concerns that this may cause false positives.

Filtered words are replaced with the first parameter to `filterFactory` and this defaults to an empty string.  This will completely remove the fitlered word leaving a space where it once was.

Different options for a single character (case insensitive) can be added so that the single character in a word to filter will match any of the options for that character.  For example, one could set "0" as a character option for "o" (which would automatically set the same for "O" by default).

## Usage
```
let sample = "This is a sentence with words in it and s om e of the w0rds loOk w3ird"

// Starts off filtering nothing
filterFactory().filterString(sample);

// Basic Usage
filterFactory().addToFilter("some").addToFilter("look").filterString(sample);
filterFactory().addAllToFilter([
  "some",
  "look",
  "words"
]).filterString(sample);

// Changing the default replacement string
filterFactory("******").addToFilter("some").addToFilter("look").filterString(sample);

// Without adding Character Options w0rds will dodge the filter
filterFactory("******").addToFilter("words").filterString(sample);

// Adding options for characters
filterFactory("******").addToFilter("words").addCharacterOption("o", "0").filterString(sample);

// Filters can also be stored and reused.
let filterA = filterFactory("***").addToFilter("X").addToFilter("Y");
let filterB = filterFactory("***").addToFilter("Z);

// Filters can be modified and these modifications can be chained
filterA.addToFilter("Foo");
filterA.addCharacterOption("o", "0");
filterB.addToFilter("Bar").addCharacterOption("a", "@");

// Order of operations with chainable functions does not matter.
// Some functions can't be chained (i.e. filterString) 
let filtered = filterA.filterString("Would you like to go to FizzBuzz park and play some foobar");

// Multiple filters can be applied to a single string
let filteredTwice = filterB.filterString(filterA.filterString("Would you like to go to FizzBuzz park and play some foobar"));
let alsoFilteredTwice = filterB.filterString(filtered);

```
