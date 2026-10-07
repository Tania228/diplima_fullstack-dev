import logging


class ConsoleFormatter(logging.Formatter):
    def format(self, record):
        prepared = logging.makeLogRecord(record.__dict__.copy())
        prepared.levelname = prepared.levelname.lower()
        return super().format(prepared)
