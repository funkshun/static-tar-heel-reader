from string import punctuation as string_punctuation
from re import escape as regex_escape, match as regex_match, split as regex_split
from nltk import word_tokenize, pos_tag, download as nltk_download
from pkg_resources import resource_filename
from symspellpy import SymSpell, Verbosity
from spellchecker import SpellChecker
from pint import UnitRegistry
from pint.errors import UndefinedUnitError, DefinitionSyntaxError, DimensionalityError

class IsNumberHelper:

    ureg = UnitRegistry()

    @staticmethod 
    def isNumber(string):
        return string.isdigit() \
            or IsNumberHelper.isCommaNumber(string) \
            or IsNumberHelper.isOrderedNumber(string) \
            or IsNumberHelper.isMathExpression(string) \
            or IsNumberHelper.isScientificNotation(string) \
            or IsNumberHelper.isExponent(string) \
            or IsNumberHelper.isHyphenNumber(string) \
            or IsNumberHelper.isSlashNumber(string) \
            or IsNumberHelper.isNumberWithUnits(string)


    @staticmethod
    def isCommaNumber(string):
        return (',' in string and IsNumberHelper.isNumber(string.replace(',', '')))
    
    @staticmethod
    def isOrderedNumber(string):
        return regex_match(r'[123456789]\d*(th|rd|nd|st)', string)
    
    @staticmethod
    def isMathExpression(string):
        return regex_match(r'[123456789]\d*((\+|\-|x|X|\*)[123456789]\d*)*=?([123456789]\d*)?', string)

    @staticmethod 
    def isScientificNotation(string):
        return regex_match(r'([123456789]\d*(\.\d*)?([xX\*]))?(\-)?10\^([-+])?\d+', string)

    @staticmethod
    def isExponent(string):
        return regex_match(r'[123456789]\d*^([\-\+])?\d+', string)

    @staticmethod
    def isHyphenNumber(string):
        return '-' in string and all([IsNumberHelper.isNumber(num) for num in string.split('-') if num])
    
    @staticmethod
    def isSlashNumber(string):
        return '/' in string and all([IsNumberHelper.isNumber(num) for num in string.split('/') if num])
    
    @staticmethod
    def isNumberWithUnits(string):
        try:
            return IsNumberHelper.ureg.parse_expression(string)
        except (UndefinedUnitError, AttributeError, DefinitionSyntaxError, DimensionalityError):
            return False

class SpellCheckHelper:
    punctuation = string_punctuation + 'º–°…-'
    regex_punctuation = str(regex_escape(punctuation))

    spell = SpellChecker()

    digits = '0123456789'

    @staticmethod
    def isTime(string):
        return regex_match(r'(\d)?\d:\d\d(pm|am|PM|AM)?', string) or regex_match(r'\d\d?(pm|am|PM|AM)', string)

    @staticmethod
    def isNum(string):
        return IsNumberHelper.isNumber(string)

    @staticmethod
    def removePunctuation(string):
        if isinstance(string, str):
            return ''.join([ch for ch in string if ch not in SpellCheckHelper.punctuation])

        return [SpellCheckHelper.removePunctuation(item) for item in string]

    @staticmethod
    def splitPunctuation(string):
        if isinstance(string, str):
            return regex_split("[" + SpellCheckHelper.regex_punctuation + "]", string)

        return [SpellCheckHelper.splitPunctuation(item) for item in string]

    @staticmethod
    def removeNumbers(string):
        if isinstance(string, str):
            return ''.join([ch for ch in string if ch not in SpellCheckHelper.digits])

        return [SpellCheckHelper.removeNumbers(item) for item in string]

    @staticmethod
    def correct(text, sym_spell):
        if isinstance(text, list):
            return all([SpellCheckHelper.correct(item, sym_spell) for item in text])

        # I find using len(x) > 0 to be more intuitive than using the natural truthiness of
        # an empty Iterable, but perhaps that's just me
        return text in SpellCheckHelper.punctuation \
            or SpellCheckHelper.isNum(text) \
            or SpellCheckHelper.isTime(text) \
            or len(sym_spell.lookup(text, Verbosity.CLOSEST, max_edit_distance=0)) > 0 \
            or len(SpellCheckHelper.spell.known(words=[text])) > 0


class BookSpellCheck:

    def __init__(self, spellcheckdata=False, stop_words=None):
        self.spellcheckdata = spellcheckdata
        self.set_unknown = set() if self.spellcheckdata else None
        self.set_known = set() if self.spellcheckdata else None
        self.stop_words = stop_words

    def get_words_to_spell(self, text):
        text = word_tokenize(text)
        tags = pos_tag(text)
        # filter out proper nouns - we assume these are spelled correctly
        if self.spellcheckdata:
            self.set_known.update([word for word, tag in tags if tag in ['NNP', 'NNPS'] or word.lower() in self.stop_words])
        return [word for word, tag in tags if tag not in ['NNP', 'NNPS'] and word not in SpellCheckHelper.punctuation and word.lower() not in self.stop_words]

    def generate_search_space(self, word, mode):
        if mode == 'simple':
            while word and word[0] in SpellCheckHelper.punctuation:
                word = word[1:]

            while word and word[-1] in SpellCheckHelper.punctuation:
                word = word[:-1]

            if not word:
                return ['true']

            res = [word, word.lower()]

            if '-' in word:
                res = res + [word.split('-')] + [word.lower().split('-')]
            elif '/' in word:
                res = res + [word.split('/')] + [word.lower().split('/')]
                
            return res

        search_space = [word, word.lower()]
        if mode == 'complex':
            search_space_result = [word, word.lower()]
            search_space_result = search_space_result + \
                list(map(SpellCheckHelper.removePunctuation, search_space))
            search_space_result = search_space_result + \
                list(map(SpellCheckHelper.splitPunctuation, search_space))
            search_space_result = search_space_result + \
                list(map(SpellCheckHelper.removeNumbers, search_space))
            return search_space_result
        else:
            # TODO: experiment with repeating?
            raise ValueError('Invalid mode')

    def hasNoSpellingErrors(self, book, sym_spell, mode='simple'):
        if self.spellcheckdata:
            correct = True
        for page in book['pages']:
            words = self.get_words_to_spell(page['text'])

            if len(words) == 0:
                continue

            for word in words:
                search_space = self.generate_search_space(word, mode)

                # print (search_space)
                curr_correct = any([SpellCheckHelper.correct(search, sym_spell) for search in search_space])

                # print (f'{search_space} {curr_correct}')

                if not curr_correct:
                    if self.spellcheckdata:
                        correct = False
                        self.set_unknown.add(word)
                    else:
                        return False
                else:
                    if self.spellcheckdata:
                        self.set_known.add(word)

        if self.spellcheckdata:
            return correct
        return True

    def spellcheck(self, books, mode='simple'):
        if mode not in ['simple', 'complex']:
            raise ValueError('Mode must be one of "simple, complex"')
        nltk_download('punkt')
        sym_spell = SymSpell(max_dictionary_edit_distance=0, prefix_length=7)
        dictionary_path = resource_filename(
            "symspellpy", "frequency_dictionary_en_82_765.txt")
        if not sym_spell.load_dictionary(dictionary_path, term_index=0, count_index=1):
            return books

        books = [book for book in books if self.hasNoSpellingErrors(
            book, sym_spell, mode)]
        return books, self.set_unknown, self.set_known
